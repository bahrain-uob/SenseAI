Dev#1
Bedrock endpoint done in the API stack

Dev#2
----> DynamoDB table created for employees activity created and python script to insert dummy data added
----> Python script to delete all the data is created as well
----> The endpoint to retrieve from the table is also created

Dev#3-Parse 
---->RawTrans table is created with primary key = rowid
----> created lambda that convert excel to a dynamoDB records
 (when file uploaded it will be inserted in RawTrans table in dynamo)
----> created lambda (no glue) that fetch records from RawTrnas table (for frontend use) 
----> endpoint url : https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction (tested ✅)
----> excel file for testing : will be found in the repo when it pulled,
two cloumns are added (rowid (becuse there is no uniqe cloumn) + risk_percentage)
----> a composed key will be used later combining (reference number + item number)
----> python script created that delete all items inside RawTrans table
 (run it before uploading something for testing ex: if you add new cloumn)
inside the lambda folder run this in command line : python3 delete_rawtransaction.py
----> python script created for adding rowid and random persentage : uniqerow.py

Dev#5 is skipped nothing to do with it


dont forget to install these in lambda/ folder
npm init -y
npm install aws-sdk
pip install boto3



Frontend Depndencies (by order)
----------> npm install react-countup recharts
----------> npm install axios
----------> npm install react-icons

Dev#7-userActions 
-----------> from dev#6 updated home.js 

