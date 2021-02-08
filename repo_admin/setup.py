import setuptools

with open("./README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="justiceai-repo-admin",
    version="0.0.1",
    author="Benetech",
    description="Administration toolkit for video fingerprint repositories.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/benetech/VideoDeduplication",
    packages=setuptools.find_packages(".", exclude=["tests"]),
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: System Administrators",
        "Topic :: Software Development :: Libraries",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: POSIX :: Linux",
    ],
    install_requires=[
        "fire",
        "SQLAlchemy",
        "PyYAML",
        "psycopg2",
        "inquirer",
        "termcolor",
        "cached-property",
        "dataclasses",
        "sqlalchemy-utils",
        "coolname",
    ],
    extras_require={
        "dev": [
            "pytest",
            "black~=20.8b1",
            "flake8",
        ],
    },
    python_requires=">=3.6",
    test_suite="tests",
    entry_points={"console_scripts": ["repo-admin=repo_admin.cli.main:main"]},
)
