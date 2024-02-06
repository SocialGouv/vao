/*Fichier SQL associé à la création de la base de données et des schema de base*/
DROP DATABASE IF EXISTS vao;
CREATE DATABASE vao;
DROP DATABASE IF EXISTS document;
CREATE DATABASE document;

\c vao;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE USER u_front WITH password 'front';
CREATE USER u_back WITH password 'back';