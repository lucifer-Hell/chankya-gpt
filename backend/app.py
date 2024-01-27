# app.py
import chromadb
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import re
from flask_cors import CORS  # Import CORS from flask_cors module
import atexit




app = Flask(__name__)
CORS(app)

model_path='./checkpoint-700'


def get_model():
    return  AutoModelForCausalLM.from_pretrained(model_path)

def get_tokenizer():
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    tokenizer.pad_token = tokenizer.eos_token
    return tokenizer



model= None
tokenizer=None
collection=None
chroma_client=None

@app.route('/predict_output', methods=['POST'])
def predict():
    try:
        input_text = request.json.get('text', '')
        print('question asked : ',input_text)
        result = interact_with_model(input_text)
        return jsonify({'output':result})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500
    
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify(message='Pong!')


def interact_with_model(input_text):
    ## encode input text 
    encoded_input = tokenizer(generate_prompt_from_question(input_text), return_tensors="pt",padding=True)["input_ids"]
    ## generate output from model
    output = model.generate(encoded_input, max_length=1000, temperature=0.7,do_sample=True,pad_token_id=tokenizer.eos_token_id)
    ## decode output
    generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
    print("response ",generated_text)
    match = re.search(r'<CHANKYA>(.*?)</CHANKYA>', generated_text, re.DOTALL)
    extracted_content = match.group(1)
    return extracted_content

def generate_metadata_and_ids(paragraphs):
    metadatas = [{"source": "book"} for _ in paragraphs]
    ids = [f"doc{i}" for i in range(len(paragraphs))]
    return metadatas, ids

def extract_paragraphs(file_path):
    paragraphs = []

    with open(file_path, 'r') as file:
        # Read the entire content of the file
        content = file.read()

        # Split the content into paragraphs using regular expression
        paragraphs = re.split(r'\n+', content)

        # Remove leading and trailing whitespaces from each paragraph
        paragraphs = [paragraph.strip() for paragraph in paragraphs if paragraph.strip()]

    return paragraphs

def create_chroma_client():
    client = chromadb.Client()
    return client


def create_chromadb_collection(client):
    try:
        collection_name='chankya-db'
        # Create a collection with the specified name
        collection = client.create_collection(collection_name)
        print('starting to add data in db ')
        file_path = './chankya.txt'
        paragraphs_array = extract_paragraphs(file_path)
        print('generating metas for data')
        metadatas, ids=generate_metadata_and_ids(paragraphs_array)
        print('meta generation completed ')
        print('adding ',len(paragraphs_array),' rows in db')
        collection.add(
            documents=paragraphs_array,
            metadatas=metadatas,
            ids=ids
        )
        print('rows updation completed ',len(paragraphs_array))
        print(f"Collection '{collection_name}' created successfully.")
        print("total rows present ",collection.count())
        return collection
    
    except Exception as e:
        print(f"Error creating collection: {e}")
        return None

def clear_db(db_client):
    if(db_client):
        print('deleting data ...')
        db_client.reset()

def get_context_for_question(ques):
    results = collection.query(query_texts=[ques],n_results=2)
    return results['documents'][0]

def generate_prompt_from_question(ques):
    context_arr=get_context_for_question(ques=ques)
    print(context_arr)
    context_string = '\n'.join(map(str, context_arr))
    # print('context_string ',context_string)
    # Use the format method to embed the context and user question into the prompt
    prompt = (
        "<INST>You are Chanakya (one of India's greatest teachers). "
        "Provide the best possible answer to the question user have asked between <USER> & </USER> tags by referencing the context present between <CONTEXT> & </CONTEXT> tags. "
        "Don't make up things on your own. Answer only in paratype format.</INST>\n"
        "<CONTEXT>\n{context}\n</CONTEXT>\n<USER>{user_question}</USER>"
    )
    # Assign the formatted prompt back to the variable
    prompt = prompt.format(context=context_string, user_question=ques)
    # print('prompt: ',prompt)
    return prompt


atexit.register(clear_db,chroma_client)


if __name__ == '__main__':
    model=get_model()
    tokenizer=get_tokenizer()
    chroma_client=create_chroma_client()
    collection=create_chromadb_collection(chroma_client)
    app.run(host='0.0.0.0',port=8000,debug=True)
