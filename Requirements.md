# OS Detector

## Goal

The OS Detector should demonstrate how the operating system can be detected from visiting a we page on a mobile phone. 

## Product requirements

The components of the OS detector are the backend collecting information on a network connection level and providing the information to the application via a simple api; and a frontend as a web page detecting the OS with javascript running on the user's device and presenting the result to the user. 

I'd use a next.js based application, because I can choose between what is rendered on the server and was is processed in the browser. I'd like to use typescript for the code and tailwindcss for the style. 

The UI should be modern and clear, blue, black, and white the main colors, with red accents. I want to show 3 main blocks on the page: 

1. the OS detected and supporting information from the server as well as the browser script. 
2. all possble information about the browser configuration (timezone, language, geometry, etc)
3. network information like IP Address, ISP, etc.

## Deployment

The result should be a docker container based on docker compose script that I can run in my docker configuration. Base image should be node.js in a small server (alpine or similar). 