import yaml
from api import api as api_blueprint
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

with open("config.yaml", 'r') as config:
    cfg = yaml.load(config)

CONNINFO = cfg['conninfo']

app = Flask(__name__, static_url_path="")
db = SQLAlchemy(app)

app.config['SQLALCHEMY_DATABASE_URI'] = CONNINFO
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.register_blueprint(api_blueprint, url_prefix='/api/v1')


@app.route('/')
def root():
    return app.send_static_file('index.html')


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
