# Northcoders News API

## Setup Instructions

To setup this project yourself:
1. **Clone the repository**: git clone <https://github.com/sorei9240/nc-news.git>
2. **Install the dependencies**: by running `npm install` in the terminal
3. **Setup your dotenv files** by adding these two files to the root directory: 
    - **.env.test** which should contain the line `PGDATABASE=nc_news_test`
    - **.env.development** which should contain `PGDATABASE=nc_news`
4. **Setup and seed the database**: 
    - run `npm run setup-dbs` and `npm run seed` in the terminal

## Testing

To run tests run the command `npm test` in the terminal.

## Version Requirements

- The minimum node version required to run this project is 14.18.0
- The minimum PostgreSQL version required to run this project is 12

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
