"""
/*  ______   ______   ___ __ __   ______   __   __      _____    ______      
 * /_____/\ /_____/\ /__//_//_/\ /_____/\ /__/\/__/\   /_____/\ /_____/\     
 * \:::__\/ \:::_ \ \\::\| \| \ \\:::_ \ \\  \ \: \ \__\:::_:\ \\:::__\/     
 *  \:\ \  __\:\ \ \ \\:.      \ \\:(_) \ \\::\_\::\/_/\   _\:\| \:\ \____   
 *   \:\ \/_/\\:\ \ \ \\:.\-/\  \ \\: ___\/ \_:::   __\/  /::_/__ \::__::/\  
 *    \:\_\ \ \\:\_\ \ \\. \  \  \ \\ \ \        \::\ \   \:\____/\\:\_\:\ \ 
 *     \_____\/ \_____\/ \__\/ \__\/ \_\/         \__\/    \_____\/ \_____\/ 
 *
 * Project: MySQL Driver for COMP426 Final Project
 * @author Samuel Andersen
 * @version 2017-11-27
 *
 * General Notes:
 *
 * Modified for COMP426
 *
 */
"""

import mysql.connector
import json

class SQLConnector:

	sqlConfig = None
	cursor = None
	cnx = None
	dictCursor = None

	def __init__(self):

		print("INFO: Opening MySQL Connection")

		# Store configuration in the base directory
		with open('config.json') as config:

			# Load the JSON data
			data = json.load(config)

			# Extract the relevant information
			self.sqlConfig = data['MySQL']

		self.cnx = mysql.connector.connect(**self.sqlConfig)
		self.cursor = self.cnx.cursor(prepared = True)
		self.dictCursor = self.cnx.cursor(buffered = True, dictionary = True)

	## Inserts a generic dictionary object into the specified table
	#  @param targetTable Table to insert dictionary into
	#  @param targetObject Dictionary to insert
	def insert(self, targetTable, targetObject):

		# We don't know the order of the fields in the record, so build this
		fieldList = ""

		for fieldName in targetObject.keys():

			fieldList += "`%s`, " % fieldName

		# Trim off the last ', '
		fieldList = fieldList[0: len(fieldList) - 2]

		# Use '?' to escape the values in MySQL
		fieldValues = ",".join(['?'] * len(targetObject.values()))

		baseQuery = "INSERT INTO `%s`(%s) VALUES(%s)" % (targetTable, fieldList, fieldValues)
		print(baseQuery)

		# Insert both into MySQL and MongoDB
		self.cursor.execute(baseQuery, [element for element in targetObject.values()])

	## Find if a record exists in a target table
	#  @param targetTable Table to search
	#  @param targetObject Dictionary representing the filter
	def getRecord(self, targetTable, targetObject):

		# We don't know the order of the fields in the record, so build this
		fieldList = ""

		for fieldName in targetObject.keys():

			fieldList += "`%s` = \'%s\' AND " % (fieldName, targetObject[fieldName])

		# Trim off the last ', '
		fieldList = fieldList[0: len(fieldList) - 5]

		baseQuery = "SELECT * FROM `%s` WHERE %s" % (targetTable, fieldList)

		self.dictCursor.execute(baseQuery)

		return [row for row in self.dictCursor]

	## Get a record via the prepared cursor (non-internal use)
	#  @param targetTable Table to query
	#  @param targetObject Dictionary representing the filter
	def externalSearch(self, targetTable, targetObject):

		# We don't know the order of the fields in the record, so build this
		fieldList = ""

		for fieldName in targetObject.keys():

			fieldList += "`%s` = ? AND " % (fieldName)

		# Trim off the last ', '
		fieldList = fieldList[0: len(fieldList) - 5]

		baseQuery = "SELECT * FROM `%s` WHERE %s" % (targetTable, fieldList)

		self.cursor.execute(baseQuery, [element for element in targetObject.values()])

		return [row for row in self.cursor]

	## Cleans up the instance, closing the connection
	def cleanUp(self):

		print("INFO: Closing MySQL Connection")

		self.cursor.close()
		self.dictCursor.close()
		self.cnx.close()
