import numpy as np
import pandas as pd
from pickle import loads
from winnow.utils.matches import get_summarized_matches, unique
import os

OUTPUT_FILENAME = "match_df.csv"
OUTPUT_FOLDER = "data"
OUTPUT_FP = os.path.join(OUTPUT_FOLDER, OUTPUT_FILENAME)
DISTANCE = 0.75
# Mappings between source ids and connection strings
connections_dict = dict(
    partner_a="postgres://postgres:admin@localhost:5432/videodeduplicationdb",
    partner_b="postgres://postgres:admin@localhost:5432/videodeduplicationdb",
    central_repo="postgres://postgres:admin@localhost:5432/videodeduplicationdb",
)

dfs = []
for identifier, connstring in connections_dict.items():

    print(f"Loading data from {identifier}")

    sample_df = pd.read_sql_query('select * from "signatures"', con=connstring)
    sample_df["identifier"] = identifier
    dfs.append(sample_df)

df = pd.concat(dfs)
del dfs

# Extract relevant information from the unified DataFrame
ids = np.array(df["file_id"])
source_identifiers = np.array(df["identifier"])
video_signatures = np.array([loads(x) for x in df["signature"].values])

# Get a summary of the matches of the input signatures as a DataFrame
match_df = get_summarized_matches(video_signatures, distance=DISTANCE)

# Enrich match data with information about the input files and source
match_df["query_video"] = ids[match_df["query"]]
match_df["query_video_source_id"] = source_identifiers[match_df["query"]]
match_df["match_video"] = ids[match_df["match"]]
match_df["match_video_source_id"] = source_identifiers[match_df["match"]]
match_df["self_match"] = match_df["query_video"] == match_df["match_video"]
# Remove self matches
match_df = match_df.loc[~match_df["self_match"], :]

# Removes duplicated entries (eg if A matches B, we don't need B matches A)
match_df["unique_index"] = match_df.apply(unique, axis=1)
match_df = match_df.drop_duplicates(subset=["unique_index"])


print(f"Saved matches to {OUTPUT_FP}")
match_df.to_csv(OUTPUT_FP)
