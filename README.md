# Blockchain Installation 

### Requirements:
- Suggested browser - Chrome
- JavaScript has to be enabled 
- Java needs to be installed
- Tomcat server

### Steps to install:
1. Download the BlockchainRepo package
2. Make sure your tomcat-users.xml is configured (check 'sample_tomcat-users.xml' file for a working example)
3. Switch on the Tomcat server 
4. Open browser and enter the url: http://localhost:{port_no}  //where port no is the port tomcat is running on
5. Click on manager app and enter the valid credentials as documented on tomcat-users.xml
6. Scroll to section Deploy -> WAR file to deploy
7. Choose file from package i.e. Blockchain/war/blockchain.war
8. Hit deploy
9. Enter the url: http://localhost:{port_no}/Blockchain/

### Notes
- If you want to compute the hash at the Java end, hit the "change pref" button, and change the language to "Java Implementation".
- Java Servlets is configured to listen on http://localhost:{port_no}/Blockchain/MineBlockServlet



