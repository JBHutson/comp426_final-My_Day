"""
/*  ______   ______   ___ __ __   ______   __   __      _____    ______      
 * /_____/\ /_____/\ /__//_//_/\ /_____/\ /__/\/__/\   /_____/\ /_____/\     
 * \:::__\/ \:::_ \ \\::\| \| \ \\:::_ \ \\  \ \: \ \__\:::_:\ \\:::__\/     
 *  \:\ \  __\:\ \ \ \\:.      \ \\:(_) \ \\::\_\::\/_/\   _\:\| \:\ \____   
 *   \:\ \/_/\\:\ \ \ \\:.\-/\  \ \\: ___\/ \_:::   __\/  /::_/__ \::__::/\  
 *    \:\_\ \ \\:\_\ \ \\. \  \  \ \\ \ \        \::\ \   \:\____/\\:\_\:\ \ 
 *     \_____\/ \_____\/ \__\/ \__\/ \_\/         \__\/    \_____\/ \_____\/ 
 *
 * Project: COMP426 Final Project
 * @author : Samuel Andersen, Yashar Asgari, Daniel Estrada, James Hutson
 * @version: 2017-12-10
 *
 * General Notes:
 *
 * TODO: Continue adding functionality 
 *
 */
"""

import requests
import sys
import json
import io
import hashlib
import string
import base64
import urllib
from flask import Flask
from flask import render_template
from flask import request
from flask import send_file
from flask import make_response
from flask import session
from flask import redirect
from flask import url_for
from flask import escape
from flask_restful import reqparse, abort, Api, Resource
from functools import wraps, update_wrapper
from datetime import datetime, timedelta
from Crypto.Cipher import AES
from Crypto import Random

from SQLConnector import *

AES_KEY = '99B4ADBF0D753829667FCAAB869575BF'
AJAX_HEADER = {'Access-Control-Allow-Origin': '*'}

CALENDAREVENT_MAP = [
	'int',
	'string',
	'date',
	'string',
	'string',
	'int']

app = Flask(__name__)
api = Api(app)

## AES Cipher Class, taken from: https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
class AESCipher(object):

	def __init__(self, key): 
		self.bs = 32
		self.key = hashlib.sha256(key.encode()).digest()

	def encrypt(self, raw):
		raw = self._pad(raw)
		iv = Random.new().read(AES.block_size)
		cipher = AES.new(self.key, AES.MODE_CBC, iv)
		return base64.b64encode(iv + cipher.encrypt(raw))

	def decrypt(self, enc):
		enc = base64.b64decode(enc)
		iv = enc[:AES.block_size]
		cipher = AES.new(self.key, AES.MODE_CBC, iv)
		return self._unpad(cipher.decrypt(enc[AES.block_size:])).decode('utf-8')

	def _pad(self, s):
		return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)

	@staticmethod
	def _unpad(s):
		return s[:-ord(s[len(s)-1:])]

## Helper function to quickly hash a string
#  @param target Target string
def hashString(target):

	return hashlib.sha256(target.encode('utf-8')).hexdigest()

## Function to check if a user exists
#  @param user Target username
def userExists(user):

	sql = SQLConnector()

	# Use the externalSearch function for queries using external inputs (i.e. user-entered)
	check = sql.externalSearch('Users', {'Username': user})

	sql.cleanUp()

	if (len(check) != 0):

		return True

	return False

## Function to add a user to the database
#  @param user Username
#  @param password Unhashed password
def addUser(user, password):

	sql = SQLConnector()

	# Don't store the plaintext password
	sql.insert('Users', {'Username': user, 'Password': hashString(password)})
	sql.cnx.commit()

	sql.cleanUp()

## Function to delete a user from the database
#  @param user Username
#  @param password Unhashed password
def deleteUser(user, password):

	sql = SQLConnector()

	# Removing the user cascades the deletion to the CalendarEvents table
	sql.cursor.execute('DELETE FROM `Users` WHERE `Username` = ? AND `Password` = ?',
		[user, hashString(password)])

	sql.cnx.commit()

	sql.cleanUp()

## Validate a password for a user
#  @param user Username
#  @param password Plaintext password to validate against
def validatePassword(user, password):

	sql = SQLConnector()

	res = sql.getRecord('Users', {'Username': user, 'Password': hashString(password)})

	sql.cleanUp()

	if (len(res) != 0):

		return True

	return False

## Function to add an event to the calendar
#  @param targetUser Username of the target
#  @param eventDate String representing a date (YYYY-MM-DD HH:MM:SS)
#  @param description Event description
#  @param shortName Name of event displayed on the calendar  
#  @param priorityLevel [Optional] event priority level
def addCalendarEvent(targetUser, eventDate, description, shortName, priorityLevel):

	sql = SQLConnector()

	try:
		sql.insert('CalendarEvents', {'OwnerId': targetUser, 'Date': eventDate, 'Description': description,
				'ShortName': shortName, 'PriorityLevel': priorityLevel})

		sql.cnx.commit()

		sql.cursor.execute("SELECT LAST_INSERT_ID()")

		res = [row for row in sql.cursor][0][0]
	except:
		print('ERROR: Insertion failed for Event for user [%s]' % targetUser)

		sql.cleanUp()
		return False

	sql.cleanUp()

	return res

## Search for a calendar event via a set of fields
#  @param filter Event search filter
def searchEvents(filter):

	sql = SQLConnector()

	res = sql.externalSearch('CalendarEvents', filter)

	sql.cleanUp()

	return res

## REST wrapper for checking if a user exists
class UserExists(Resource):

	## GET request
	#  @param username Target username
	def get(self, username):

		if (userExists(username)):

			return 'User exists.', 200, AJAX_HEADER

		return 'User not found.', 404, AJAX_HEADER

## REST wrapper for adding a user
class AddUser(Resource):

	## POST request
	def post(self):

		# Instantiate the request parser
		parser = reqparse.RequestParser()

		parser.add_argument('username')
		parser.add_argument('password')

		args = parser.parse_args()

		if (not args['username'] or not args['password']):

			return 'ERROR: Invalid request received', 400, AJAX_HEADER

		if (userExists(args['username'])):

			return 'ERROR: Username already in use', 400, AJAX_HEADER

		print("INFO: Received request to add user [%s]" % args['username'])

		addUser(args['username'], args['password'])

		return "Request processed", 200, AJAX_HEADER

## REST wrapper for user authentication
class AuthenticateUser(Resource):

	## POST request
	def post(self):

		# Instantiate the request parser
		parser = reqparse.RequestParser()

		parser.add_argument('username')
		parser.add_argument('password')

		args = parser.parse_args()

		if (not args['username'] or not args['password']):

			return 'ERROR: Invalid request received', 400, AJAX_HEADER

		if (validatePassword(args['username'], args['password'])):

			Encryption = AESCipher(AES_KEY)

			expiryTime = datetime.now().replace(microsecond = 0) + timedelta(seconds = 600)
			
			return Encryption.encrypt(
				json.dumps({
					'username': args['username'],
					'expires': str(expiryTime)
					})).decode('utf-8'), 200, AJAX_HEADER

		return 'ERROR: Unable to authenticate user', 401, AJAX_HEADER

## REST wrapper for validating encrypted session information
class ValidateSession(Resource):

	## POST request
	#  Returns -1 if the request wasn't made properly
	#  Returns 0 if the user does not have a valid session
	#  Returns the username if the session is valid
	def post(self):

		# Instantiate the request parser
		parser = reqparse.RequestParser()

		parser.add_argument('encryptedSession')

		args = parser.parse_args()

		if (not args['encryptedSession']):

			return 'ERROR: Malformed request', 400, AJAX_HEADER

		Encryption = AESCipher(AES_KEY)

		try:

			decryptedSession = json.loads(Encryption.decrypt(args['encryptedSession']))

			if (datetime.now() < datetime.strptime(decryptedSession['expires'], '%Y-%m-%d %H:%M:%S')):

				return decryptedSession['username'], 200, AJAX_HEADER

		except:

			return 'ERROR: Malformed request', 400, AJAX_HEADER

		return 'ERROR: Invalid session', 401, AJAX_HEADER

## REST wrapper for deleting a user
class DeleteUser(Resource):

	## DELETE request
	def delete(self):

		# Instantiate the request parser
		parser = reqparse.RequestParser()

		parser.add_argument('username')
		parser.add_argument('password')

		args = parser.parse_args()

		if (not args['username'] or not args['password']):

			return 'ERROR: Invalid request received', 400, AJAX_HEADER

		if (not validatePassword(args['username'], args['password'])):

			return 'WARN: User does not exist or provided the incorrect password', 401, AJAX_HEADER

		print("INFO: Received request to delete user [%s]" % args['username'])

		deleteUser(args['username'], args['password'])

		return "Request processed", 200, AJAX_HEADER

## REST wrapper for adding a calendar event
class AddEvent(Resource):

	## POST request
	def post(self):

		# Instantiate the request parser
		parser = reqparse.RequestParser()

		parser.add_argument('targetUser')
		parser.add_argument('eventDate')
		parser.add_argument('shortName')
		parser.add_argument('description')
		parser.add_argument('priorityLevel')

		args = parser.parse_args()

		return addCalendarEvent(**args), 200, AJAX_HEADER

## REST wrapper for getting calendar events for a user
class GetMonthEvents(Resource):

	## GET request
	def get(self, username, year, month):
		
		sql = SQLConnector()

		sql.cursor.execute("""
			SELECT
				* 
			FROM 
				`CalendarEvents` 
			WHERE
				`OwnerId` = ?
				AND YEAR(Date) = ?
				AND MONTH(Date) = ?
			""", [username, year, month])

		res = sql.cursor.fetchall()

		retVal = []

		for row in res:

			record = {}

			record['id'] = row[0]
			record['OwnerId'] = row[1].decode('utf-8')
			record['Date'] = str(row[2])
			record['Description'] = row[3].decode('utf-8')
			record['ShortName'] = row[4].decode('utf-8')
			record['PriorityLevel'] = row[5]

			retVal.append(record)

		sql.cleanUp()

		return retVal, 200, AJAX_HEADER

class GetDayEvents(Resource):

	## GET request
	def get(self, username, year, month, day):
		
		sql = SQLConnector()

		sql.cursor.execute("""
			SELECT
				* 
			FROM 
				`CalendarEvents` 
			WHERE
				`OwnerId` = ?
				AND YEAR(Date) = ?
				AND MONTH(Date) = ?
				AND DAY(Date) = ?
			""", [username, year, month, day])

		res = sql.cursor.fetchall()

		retVal = []

		for row in res:

			record = {}

			record['id'] = row[0]
			record['OwnerId'] = row[1].decode('utf-8')
			record['Date'] = str(row[2])
			record['Description'] = row[3].decode('utf-8')
			record['ShortName'] = row[4].decode('utf-8')
			record['PriorityLevel'] = row[5]

			retVal.append(record)

		sql.cleanUp()

		return retVal, 200, AJAX_HEADER

## REST wrapper for deleting an event
class DeleteEvent(Resource):

	## DELETE request
	def delete(self, eventId):

		sql = SQLConnector()

		sql.cursor.execute("DELETE FROM `CalendarEvents` WHERE `id` = ?", [eventId])
		sql.cnx.commit()

		sql.cleanUp()

		return True, 200, AJAX_HEADER

api.add_resource(UserExists, '/user_exists/<string:username>')
api.add_resource(AddUser, '/add_user')
api.add_resource(AuthenticateUser, '/auth')
api.add_resource(DeleteUser, '/delete_user')
api.add_resource(ValidateSession, '/validate_session')
api.add_resource(AddEvent, '/add_event')
api.add_resource(GetMonthEvents, '/get_month/<string:username>/<int:year>/<int:month>')
api.add_resource(GetDayEvents, '/get_day/<string:username>/<int:year>/<int:month>/<int:day>')
api.add_resource(DeleteEvent, '/delete_event/<int:eventId>')

## Get an Event's Id by matching user, time, and shortName

if __name__ == '__main__':
	
	app.run(host='0.0.0.0', port=5001, ssl_context = ('../certs/app.andersentech.net.crt',
		'../certs/app.andersentech.net.key'))