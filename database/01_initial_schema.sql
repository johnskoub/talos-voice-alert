CREATE TABLE IF NOT EXISTS floor_elements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    floor_id BIGINT NOT NULL,

    type VARCHAR(50) NOT NULL,

    name VARCHAR(150),

    x DECIMAL(6,3) NOT NULL,
    y DECIMAL(6,3) NOT NULL,

    width DECIMAL(6,3),
    height DECIMAL(6,3),

    side VARCHAR(20),

    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',

    category VARCHAR(50),

    severity VARCHAR(30),

    disabled_during_fire BOOLEAN NOT NULL DEFAULT FALSE,

    smoke_detected BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_floor_elements_floor
        FOREIGN KEY (floor_id)
        REFERENCES floors(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS route_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    floor_id BIGINT NOT NULL,

    from_node_id BIGINT NOT NULL,

    to_node_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_route_connections_floor
        FOREIGN KEY (floor_id)
        REFERENCES floors(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_route_connections_from_node
        FOREIGN KEY (from_node_id)
        REFERENCES floor_elements(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_route_connections_to_node
        FOREIGN KEY (to_node_id)
        REFERENCES floor_elements(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_route_connection
        UNIQUE (floor_id, from_node_id, to_node_id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    company_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    role VARCHAR(50) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_company_users_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_company_users_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_company_user
        UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS emergency_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    company_id BIGINT NOT NULL,

    floor_id BIGINT NOT NULL,

    event_type VARCHAR(50) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    severity VARCHAR(30),

    x DECIMAL(6,3) NOT NULL,

    y DECIMAL(6,3) NOT NULL,

    smoke_detected BOOLEAN NOT NULL DEFAULT FALSE,

    description VARCHAR(500),

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ended_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_emergency_events_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emergency_events_floor
        FOREIGN KEY (floor_id)
        REFERENCES floors(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evacuation_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    emergency_event_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL,

    routing_algorithm VARCHAR(50) NOT NULL DEFAULT 'WEIGHTED_GRAPH',

    safe_exits_count INT NOT NULL DEFAULT 0,

    blocked_exits_count INT NOT NULL DEFAULT 0,

    result_message VARCHAR(1000),

    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evacuation_runs_emergency
        FOREIGN KEY (emergency_event_id)
        REFERENCES emergency_events(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evacuation_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    evacuation_run_id BIGINT NOT NULL,

    occupant_element_id BIGINT NOT NULL,

    selected_exit_element_id BIGINT,

    route_distance DECIMAL(10,3),

    assignment_status VARCHAR(30) NOT NULL DEFAULT 'ROUTE_FOUND',

    is_alternative_route BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evacuation_assignments_run
        FOREIGN KEY (evacuation_run_id)
        REFERENCES evacuation_runs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evacuation_assignments_occupant
        FOREIGN KEY (occupant_element_id)
        REFERENCES floor_elements(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_evacuation_assignments_exit
        FOREIGN KEY (selected_exit_element_id)
        REFERENCES floor_elements(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_evacuation_assignment
        UNIQUE (evacuation_run_id, occupant_element_id)
);