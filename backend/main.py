from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from typing import Optional
from pydantic import BaseModel
from langchain.chat_models import ChatOpenAI
from langchain.chains import create_extraction_chain
import DeepImageSearch
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "mysql+pymysql://root:root@localhost:3306/aldo_hackathon"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# SQLAlchemy model
class Shoe(db.Model):
    __tablename__ = "shoes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    image_url = db.Column(db.String(255))
    price = db.Column(db.Float)
    gender = db.Column(db.String(50))
    category = db.Column(db.String(50))
    colour = db.Column(db.String(50))
    features = db.Column(db.String(255))


# Pydantic model
class ShoeProperties(BaseModel):
    gender: Optional[str] = None
    category: Optional[str] = None
    colour: Optional[str] = None
    price_lb: Optional[int] = None
    price_ub: Optional[int] = None
    features: Optional[str] = None


def normalize_gender(properties):
    gender_mapping = {
        "men": "Men",
        "mens": "Men",
        "man": "Men",
        "male": "Men",
        "gentleman": "Men",
        "gentlemen": "Men",
        "boys": "Men",
        "boy": "Men",
        "guy": "Men",
        "guys": "Men",
        "he": "Men",
        "him": "Men",
        "his": "Men",
        "women": "Women",
        "womens": "Women",
        "woman": "Women",
        "female": "Women",
        "ladies": "Women",
        "lady": "Women",
        "girls": "Women",
        "girl": "Women",
        "gal": "Women",
        "gals": "Women",
        "she": "Women",
        "her": "Women",
        "hers": "Women",
    }

    # Convert gender to lowercase and map to normalized gender
    normalized_gender = gender_mapping.get(properties.gender.lower(), properties.gender)

    # Return a new instance of ShoeProperties with normalized gender
    return properties.model_copy(update={"gender": normalized_gender})


# Function to extract shoe properties
def extract_properties(
    input_text: str, model_name: str = "gpt-3.5-turbo"
) -> ShoeProperties:
    llm = ChatOpenAI(temperature=0, model=model_name)
    chain = create_extraction_chain(ShoeProperties.model_json_schema(), llm)
    extracted_data = chain.run(input_text)
    return ShoeProperties(**extracted_data[0])


@app.route("/aisearch", methods=["GET"])
def aisearch():
    try:
        # Extracting 'q' parameter from the URL query parameters
        search_query = request.args.get("q")
        properties = extract_properties(search_query)
        properties = normalize_gender(properties)  # Re-assign the normalized properties
        print(properties)  # Ensure properties are printed in a readable format

        # Construct query filters
        filters = []

        if properties.gender:
            filters.append(Shoe.gender == properties.gender)
        if properties.category:
            filters.append(Shoe.category == properties.category)
        if properties.colour:
            filters.append(Shoe.colour == properties.colour)
        if properties.features:
            filters.append(Shoe.features == properties.features)
        if properties.price_lb and properties.price_ub:
            filters.append(Shoe.price.between(properties.price_lb, properties.price_ub))
        elif properties.price_lb:
            filters.append(Shoe.price >= properties.price_lb)
        elif properties.price_ub:
            filters.append(Shoe.price <= properties.price_ub)

        # If there are filters, apply them to the query
        query = db.session.query(Shoe)
        if filters:
            query = query.filter(and_(*filters))

        results = query.all()

        # Convert results to JSON-friendly format
        results_json = [
            {"name": shoe.name, "image_url": shoe.image_url, "price": shoe.price}
            for shoe in results
        ]

        return jsonify({"matching_shoes": results_json})
    except Exception as e:
        return jsonify(error=str(e)), 400


# Folder to store uploaded images
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables to store the search setup and metadata
st = None
metadata = None
image_list = None

# Allowed extensions for image upload
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def initialize():
    global st, metadata, image_list

    # Load images from a folder
    image_list = DeepImageSearch.Load_Data().from_folder(["./static/img"])

    # Set up the search engine
    st = DeepImageSearch.Search_Setup(
        image_list=image_list, model_name="vgg19", pretrained=True, image_count=100
    )

    # Index the images
    st.run_index()

    # Get metadata
    metadata = st.get_image_metadata_file()


@app.route("/similar_images", methods=["POST"])
def get_similar_images():
    global st, image_list  # Ensure to make image_list a global variable

    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    # If the user does not select a file, the browser submits an empty file part without a filename.
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the file
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        # Get similar images (indices)
        similar_image_indices = st.get_similar_images(
            image_path=filepath, number_of_images=3
        )

        # Convert numpy integers to Python integers
        similar_image_indices = [int(x) for x in similar_image_indices]

        # Map indices to file paths
        similar_image_paths = [image_list[index] for index in similar_image_indices]

        # Adjusting the paths of similar images
        similar_image_paths = [
            "static/img/" + os.path.basename(image_list[index])
            for index in similar_image_indices
        ]

        return jsonify({"similar_images": similar_image_paths})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Initialize the setup on startup
initialize()

if __name__ == "__main__":
    app.run(debug=True)
