from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import yaml

with open("config.yaml", 'r') as ymlfile:
    cfg = yaml.load(ymlfile)
     
CONNINFO = cfg['conninfo']

app = Flask(__name__)
db = SQLAlchemy(app)


app.config['SQLALCHEMY_DATABASE_URI'] = CONNINFO
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from api import api as api_blueprint

print(api_blueprint)
app.register_blueprint(api_blueprint, url_prefix='/api/v1')



if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)