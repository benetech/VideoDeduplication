echo "Running unit tests"

python -m pytest tests/general_tests.py

echo "Running Extract Features script on test data"

python extract_features.py --config tests/config.yaml

echo "Running Generate Matches script on test data"

python generate_matches.py --config tests/config.yaml

echo "Running process_video.py on sample file"

python process_video.py tests/test_data/test_videos/00c235f48ba0445aa1e526f97af33f8e.mp4

echo "Cleaning up"

rm -rf tests/test_data/test_output


