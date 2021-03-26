# Sharing Fingerprints

JusticeAI facilitates sharing fingerprints between different organizations by providing a fingerprint repository concept.
Fingerprint repository is a centralized storage which may be accessed by multiple organizations (contributors) via the 
Internet to push (upload) and pull (download) fingerprints. 

Each repository entry consists of the following elements:

| Attribute   | Type       | Description                                              |
| ----------- |:----------:| --------------------------------------------------------:|
| id          | integer    | Auto-generated integer identifying each repository entry |
| sha256      | string     | SHA256 hash of the media file                            |
| fingerprint | byte array | Binary representation of the media file fingerprint      |
| contributor | string     | Any string identifying contributor of the fingerprint    |

Each contributor may see only hashes and fingerprints of other contributors' media files. Thus, the content of their
media files cannot be determined by other contributors unless they have exactly the same or similar files. 

## Administering Fingerprint Repositories

JusticeAI provides a command line tool called `repo-admin` to create and maintain fingerprint repositories. 

### Repository Anatomy

Currently `repo-admin` supports only a "bare database" fingerprint repositories. A bare-database repository
is a PostgreSQL database which supports password authentication for repository administrators and contributors. 

Contributors access repository database directly and execute SQL queries to push and pull fingerprints. Each contributor
has a separate PostgreSQL role to perform CRUD operations on fingerprints. All contributor roles are inherited from the
`benetech_repo_user_group` role.

The repository database consists of a single table called `fingerprints` to hold all the contributed data:
```
\d fingerprints;
```
```
                   Table "public.fingerprints"
   Column    |       Type        | Collation | Nullable | Default 
-------------+-------------------+-----------+----------+---------
 id          | integer           |           | not null | 
 sha256      | character varying |           | not null | 
 fingerprint | bytea             |           | not null | 
 contributor | character varying |           | not null | 
Indexes:
    "fingerprints_pkey" PRIMARY KEY, btree (id)
    "contributor_file_unique_constraint" UNIQUE CONSTRAINT, btree (contributor, sha256)
Triggers:
    delete_fingerprint_trigger BEFORE DELETE ON fingerprints FOR EACH ROW EXECUTE FUNCTION delete_fingerprint_func()
    insert_fingerprint_trigger BEFORE INSERT ON fingerprints FOR EACH ROW EXECUTE FUNCTION insert_fingerprint_func()
    update_fingerprint_trigger BEFORE UPDATE ON fingerprints FOR EACH ROW EXECUTE FUNCTION update_fingerprint_func()
```

The following constraints are applied when contributors perform CRUD operations on the `fingerprint` tables:
1. Contributors cannot have 2 entries with the same `sha256` (exact duplicates are not allowed). This is ensured by 
   the `contributor_file_unique_constraint`
2. Contributors can only insert entries with `contributor` column equal to their own database username. This is ensured
   by the `insert_fingerprint_trigger`. When contributor attempts to insert wrong `contributor` value it is silently
   replaced by the correct contributor username.
3. Contributors may only delete or update their own entries (i.e. with the `contributor` column equal to their own 
   database username). This is ensured by the `insert_fingerprint_trigger` and `update_fingerprint_trigger`. Any 
   attempt to delete or update other contributors' entries will be silently ignored.
4. Contributors may select any row from the `fingerprints` table.

### Managing Repository List

The `repo-admin` CLI tool assumes that you already have a PostgreSQL database which you may access using 
role-name/password authentication and that you have privileges to create new roles, tables and triggers.

`repo-admin` remembers a list of your repositories. Each repository has its unique name network address and credentials.
`repo-admin` stores the list of your repositories along with their credentials in the `~/.benetech-repo-admin` directory.
All operations with repositories require the corresponding repository name as an argument.

To add a new repository execute:
```shell
repo-admin add --name=<REPOSITORY_NAME> --host=<HOSTNAME> --port=<PORT> --database=<DATABSE_NAME> --username=<USERNAME>
```
where `<REPOSITORY_NAME>` could be any name you like. You will use this name to refer to this repository in other 
commands. `repo-admin` will ask you for a password corresponding to the `<USERNAME>` role. Note that this command 
will do nothing but add a new entry to your repository list in the `~/.benetech-repo-admin` folder.

To remove repository from the list execute:
```shell
repo-admin delete <REPOSITORY_NAME>
```

To print the repository list execute: 
```shell
repos-admin list
```

### Initializing Repository

To initialize a repository execute the following command:
```shell
repo-admin init <REPOSITORY_NAME>
```

This command will create a parent role for all contributors (`benetech_repo_user_group`) and create all required schema
constructs (`fingerprints` table, triggers, etc.)

To remove all contributors and schema constructs execute: 
```shell
repo-admin drop <REPOSITORY_NAME>
```

This will also remove all the fingerprint data permanently. 

### Managing Contributors

To list existing contributors execute the following command:
```shell
repo-admin user list <REPOSITORY_NAME>
```

To create a new contributor execute:
```shell
repo-admin user add <REPOSITORY_NAME> [--username=<USERNAME>] [--password=<PASSWORD>]
```

You may omit the `--username` argument. In this case a random name will be generated. If you do not provide the
`--password` argument, `repo-admin` will ask you to type password interactively. If you provide an empty password,
`repo-admin` will generate a random password for you. This command will print username and password of the created
database role. This will be the only time you'll be able to see this password, so make sure you saved it properly. 
As a repository owner you will need to provide these credentials to the corresponding contributor. Note that the 
contributor name is case-insensitive and will be lower-cased. 

To change a contributor password execute:
```shell
repo-admin user update <REPOSITORY_NAME> <USERNAME> [--new_password=<NEW_PASSWORD>]
```
If the `--new_password` argument is not provided, `repo-admin` will ask you to type a new password interactively.
If you provide an empty password, `repo-admin` will generate a random password for you. 

To delete a contributor execute:
```shell
repo-admin user delete <REPOSITORY_NAME> <USERNAME>
```

This command will only remove the corresponding database role, it will not delete the contributor's fingerprints from 
the repository.

### Example: Initialize Repository and Create a Contributor 

Suppose you already have an empty PostgreSQL database called `example` with address `tcp://example.com:5432` and you 
have an `admin` role with all required privileges. To initialize a repository and create a new user perform the 
following steps:

1. Install the `repo-admin` tool
   1. Clone the JusticeAI repository
      ```shell
      git clone git@github.com:benetech/VideoDeduplication.git
      ```
   2. Go to the `repo_admin` sub-folder:
      ```shell
      cd VideoDeduplication/repo_admin
      ```
   3. Install the `repo-admin` tool
      ```shell
      pip install -e .
      ```
2. Add the repository to the repository list and provide a password:
   ```shell
   repo-admin add --name=central --host=example.com --port=5432 --database=example --username=admin
   ```
   ```
   [?] Please enter admin password for repository 'central': ************
   Repository 'central' successfully saved to /home/username/.benetech-repo-admin.
   ```
3. Initialize repository
   ```shell
   repo-admin init central
   ```
4. Create a new contributor (just press Enter when `repo-admin` will ask you for a new password)
   ```shell
   repo-admin user add central
   ```
   ```
   [?] Please enter password for a contributor role (or press Enter to generate a random one): 
   Successfully created a new contributor:
   [username]: radical_smilodon
   [password]: 'lY6FfCFVQE1uw4V1YogPr7oScZttdqx0U7WX9B6x4kVTt3m-UO18Dw'
    
   WARNING: This is the only time you will be able to view this password. However you can modify users to create a new password at any time.
   ```
5. Send the username `radical_smilodon` and password `lY6FfCFVQE1uw4V1YogPr7oScZttdqx0U7WX9B6x4kVTt3m-UO18Dw` to the 
   corresponding contributor. 
   

## Sharing and Pulling Fingerprints

JusticeAI provides a `just` command-line tool to facilitate sharing (pushing) and pulling fingerprints. 

To add a new repository execute the following command: 
```
just repo add --name=<REPOSITORY_NAME> --address=<DATABASE_URI> --user=<USERNAME> [--password=<PASSWORD>]
```
Where `<REPOSITORY_NAME>` is whatever repository name you like, `<DATABSE_URI>` is a valid database URI
of the form `postgresql://<host>:<port>/<name>`, and `<USERNAME>` is a contributor name provided by 
the repository owner. If you don't provide the `--password` argument the `just` will ask you to type password 
interactively. 

To list known repositories execute: 
```shell
just repo list
```
or
```shell
just get repos
```

To push all existing fingerprints execute:
```shell
just push <REPOSITORY_NAME>
```

To pull all fingerprints from the remote repository execute:
```shell
just pull <REPOSITORY_NAME>
```

To match your local fingerprints to pulled remote fingerprints execute: 
```shell
just find remote-matches
```

### Example: Accessing Repository and Pulling Fingerprints

Suppose there is a "bare database" repository called `example` at the `tcp://example.com:5432` and the repository owner
provided you a contributor name `radical_smilodon` with its password.

1. Save a repository contributor credentials:
   ```shell
   just repo add --name=central --address=postgresql://example.com:5432/example --user=radical_smilodon
   ```
   ```
   [?] Please enter database password: ******************************************************
   ```
2. Make sure the repository credentials are saved correctly:
   ```shell
   just get repos
   ```
   ```
   NAME     ADDRESS                              USER              TYPE                        
   central  postgresql://example.com:5432/example  radical_smilodon  RepositoryType.BARE_DATABASE
   ```
3. Push your fingerprints to the remote repository:
   ```shell
   just push central
   ```
   ```
   100%|████████████| 42/42 [00:00<00:00, 357.60fingerprints/s]
   ```
4. Pull fingerprints from the remote repository:
   ```shell
   just pull central
   ```
   ```
   100%|█████████████| 1000/1000 [00:00<00:00, 243.41fingerprints/s]
   ```
5. Match local fingerprints with remote fingerprints:
   ```shell
   just find remote-matches 
   ```
   ```
   Starting remote match detection.
   100%|█████████████| 7/7 [00:00<00:00, 123.41 it/s]
   Done remote match detection.
   ```
