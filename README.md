# ThermoPro TP357 and TP357S Browser Reader

This project provides a simple quick and dirty solution to read data from ThermoPro TP357 and TP357S devices in a web browser.

**Note:** This application only runs on Chrome and Edge browsers and uses the browser Bluetooth API.


## Local Development

To set up the project locally, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run the following command to install the required dependencies:
    ```shell
    docker-compose run --rm node npm install
    ```
4. Start the development server by running the following command:
    ```shell
    docker-compose up
    ```
5. Open your web browser and navigate to `localhost:3000` to access the application.

## Usage

Once the application is running, you can use it to read data from ThermoPro TP357 and TP357S devices. Please ensure that your device is connected to your computer before using the application.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Production

you can build a production image with 
```shell
docker-compose -f docker-compose.yml build 
```
and run it with 
```shell
docker-compose -f docker-compose.yml up 
```
port will be 3003 

or deploy it whereever you want
