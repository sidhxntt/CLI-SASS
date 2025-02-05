```mermaid
erDiagram
    User ||--o| Address : has
    User ||--o{ Album : has
    User ||--o{ Post : has
    User ||--o{ Todos : has
    Album ||--o{ Image : contains
    Api_users {
        int id PK
        string username UK
        string password
    }
    User {
        int id PK
        string name
        string username UK
        string email UK
        string phone UK
        string website UK
    }
    Address {
        int id PK
        string street
        string suite
        string city
        string zipcode
        int userID UK, FK
    }
    Album {
        int id PK
        int userID FK
        string title
    }
    Image {
        int id PK
        int albumID FK
        string title
        string url
        string thumbnailUrl
    }
    Post {
        int id PK
        int userID FK
        string title
        string body
    }
    Todos {
        int id PK
        int userID FK
        string title
        boolean completed
    }