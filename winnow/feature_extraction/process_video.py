import click


SAMPLE_API_KEY = 'b1b15e88fa797225412429c1c50c122a1'


def current_weather(location, api_key=SAMPLE_API_KEY):
    url = 'https://api.openweathermap.org/data/2.5/weather'

    query_params = {
        'q': location,
        'appid': api_key,
    }

    response = requests.get(url, params=query_params)

    return response.json()['weather'][0]['description']


@click.command()
@click.argument('path')
@click.argument('output',default='data/')
@click.option(
    '--config', '-cp',
    help='path to the project config file,
    default='config.yaml'
)
def main(path,output,config):
    """
    Application to extract features from a single video file
    """
    
    print(path,output,config)

    # weather = current_weather(location, api_key)
    # print(f"The weather in {location} right now: {weather}.")


if __name__ == "__main__":
    main()