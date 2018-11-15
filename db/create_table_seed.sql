CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    user_name   VARCHAR(180),
    email       VARCHAR(180),
    picture     TEXT,
    auth_id     TEXT
);


INSERT INTO users
(user_name, email, img, auth_id)
VALUES
( $1, $2, $3, $4 )
RETURNING *;



