# Workato Dashboard API

## Routes

### Users

-**GET /users/**
    - Gets the list of all users.
    - Required scope: `admin`
-**GET /users/#id**
    - Gets details for a single user.
    - Required scope: `user` (to view self), `admin` (to view any user)
-**POST /users/**
    - Creates a user
    - Required scope: `user` (to create one's own user), `admin` (to create any user)
-**PUT /users/#id**
    - Updates a user
    - Required scope: `user` (to update self), `admin` (to update any user)

### Recipes

-**GET /recipes/**
    - Gets a list of all recipes
    - With scope `admin`, lists all recipes in the system
    - With scope `user`, lists all recipes associated with that account
-**POST /recipes/**
    - Add a recipe to the system
    - Required scope: `user`
-**GET /recipes/#id**
    - Gets details for a recipe
    - Required scope: `user` (for own recipe), `admin` (for any recipe)
-**PUT /recipes/#id**
    - Update a recipe
    - Required scope: `user` (for own recipe), `admin` (for any recipe)
-**DELETE /recipes/#id**
    - Deletes a recipe, ceasing all monitoring and alerts
    - Required scope: `user` (for own recipe), `admin` (for any recipe)