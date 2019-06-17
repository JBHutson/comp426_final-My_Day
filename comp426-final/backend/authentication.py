from flask import Flask
from flask_httpauth import HTTPBasicAuth

app = Flask(__name__)
auth = HTTPBasicAuth()

@auth.verify_password
def verify_password(user, password):
    if userExists(user):
        return validatePassword(user, password)
    else:
        return False

@app.route('/')
@auth.login_required
#insert function requiring authentication 