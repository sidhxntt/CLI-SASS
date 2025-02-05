```mermaid
graph LR
    Server((SERVER\nlocalhost:8000)) --> MainRouteClass

    subgraph MainRouteClass[MAIN ROUTE CLASS]
        MainRoutes[Main Routes]
        MainRoutes --> |api/v1/users| UsersRoutes
        MainRoutes --> |api/v1/todos| TodosRoutes
        MainRoutes --> |api/v1/signup| Signup
        MainRoutes --> |api/v1/login| Login
    end

    subgraph SubroutesClass[SUBROUTES CLASS]
        subgraph UsersRoutes[Subroutes for users]
            Users1[GET api/v1/users] --> GetAllData
            Users2[GET api/v1/users/1] --> GetOneData
            Users3[POST api/v1/users] --> CreateData
        end

        subgraph TodosRoutes[Subroutes for todos]
            Todos1[GET api/v1/todos] --> GetAllData
            Todos2[GET api/v1/todos/1] --> GetOneData
            Todos3[POST api/v1/todos] --> CreateData
        end
    end

    subgraph DataClass[DATA CLASS]
        GetAllData[func to get all\ndata]
        GetOneData[func to get 1\ndata]
        CreateData[func to create\ndata]
        CreateData --> SoOn1[so on..]
    end

    style Server fill:#000,stroke:#fff,color:#fff
    style MainRouteClass stroke:#fff,color:#fff
    style SubroutesClass stroke:#fff,color:#fff
    style DataClass stroke:#fff,color:#fff
    style GetAllData fill:#000,stroke:#fff,color:#fff
    style GetOneData fill:#000,stroke:#fff,color:#fff
    style CreateData fill:#000,stroke:#fff,color:#fff
    style SoOn1 fill:#000,stroke:#fff,color:#fff
    style Users1 fill:#000,stroke:#fff,color:#fff
    style Users2 fill:#000,stroke:#fff,color:#fff
    style Users3 fill:#000,stroke:#fff,color:#fff
    style Todos1 fill:#000,stroke:#fff,color:#fff
    style Todos2 fill:#000,stroke:#fff,color:#fff
    style Todos3 fill:#000,stroke:#fff,color:#fff
    style MainRoutes fill:#000,stroke:#fff,color:#fff