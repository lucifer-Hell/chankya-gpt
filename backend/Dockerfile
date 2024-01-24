# Use the official Python image with Python 3.11
FROM python:3.11

# Set the working directory
WORKDIR /app

# Copy requirements.txt to the working directory
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the port on which the Python server will run (adjust if needed)
EXPOSE 8000

# Start the Python server
CMD ["python", "app.py"]
