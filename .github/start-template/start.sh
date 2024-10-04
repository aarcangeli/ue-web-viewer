echo "Starting the server at http://localhost:8080"
cd $(dirname $0)
python -m http.server 8080
