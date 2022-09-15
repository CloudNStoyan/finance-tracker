create sequence user_account_user_id_seq
    as integer;

alter sequence user_account_user_id_seq owner to root;

create sequence session_session_id_seq
    as integer;

alter sequence session_session_id_seq owner to root;

create sequence category_category_id_seq
    as integer;

alter sequence category_category_id_seq owner to root;

create sequence user_transactions_user_transaction_id_sq
    as integer;

alter sequence user_transactions_user_transaction_id_sq owner to root;

create table user_accounts
(
    user_id  integer default nextval('user_account_user_id_seq'::regclass) not null
        constraint user_account_pkey
            primary key,
    username text                                                          not null
        constraint user_account_username_key
            unique,
    password bytea                                                         not null
);

alter table user_accounts
    owner to root;

alter sequence user_account_user_id_seq owned by user_accounts.user_id;

create table sessions
(
    session_id      integer default nextval('session_session_id_seq'::regclass) not null
        constraint session_pkey
            primary key,
    session_key     text                                                        not null,
    login_time      timestamp                                                   not null,
    user_id         integer
        constraint session_user_id_fkey
            references user_accounts,
    logged_out      boolean,
    logout_time     timestamp,
    expiration_date timestamp
);

alter table sessions
    owner to root;

alter sequence session_session_id_seq owned by sessions.session_id;

create table categories
(
    category_id      integer default nextval('category_category_id_seq'::regclass) not null
        constraint category_pkey
            primary key,
    name             text                                                          not null,
    background_color text                                                          not null,
    list_order       integer                                                       not null,
    icon             text                                                          not null,
    user_id          integer
        constraint category_user_id_fkey
            references user_accounts
);

alter table categories
    owner to root;

alter sequence category_category_id_seq owned by categories.category_id;

create table user_transactions
(
    user_transaction_id integer default nextval('user_transactions_user_transaction_id_sq'::regclass) not null
        constraint transaction_pkey
            primary key,
    user_id             integer
        constraint transaction_user_id_fkey
            references user_accounts,
    category_id         integer
        constraint transaction_category_id_fkey
            references categories,
    value               money                                                                         not null,
    type                text                                                                          not null,
    confirmed           boolean                                                                       not null,
    details             text,
    label               text                                                                          not null,
    transaction_date    date                                                                          not null,
    repeat              text,
    repeat_end          date
);

alter table user_transactions
    owner to root;

alter sequence user_transactions_user_transaction_id_sq owned by user_transactions.user_transaction_id;