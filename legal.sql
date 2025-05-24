CREATE TABLE modalidad_contrato(
    id_det_contratfin       SERIAL PRIMARY KEY,
    mod_contrato            VARCHAR(100),
    estado                  SMALLINT DEFAULT 1 CHECK (estado IN (0, 1))
);
INSERT INTO detalle_contract_finan(mod_contrato)
VALUES
('ANPE'),
('COMPARACIÓN DE PRECIOS'),
('COMPARACIÓN DE PRECIOS BID'),
('CONTINUIDAD'),
('CONTRATACIÓN DIRECTA'),
('CONTRATACIÓN DIRECTA BID'),
('CONTRATACIÓN MENOR'),
('CRITERIO LEGAL CONSULTORIA'),
('EXPRESIONES DE INTERES'),
('INFORME LEGAL APROBACIÓN DEL DOCUMENTO DE LICITACIÓN'),
('INFORME LEGAL CONTRATO MODIFICATORIO'),
('INFORME LEGAL RECOMENDACIÓN DE FIRMA DE CONVENIO DE COOPERACIÓN'),
('INFORME RESOLUCIÓN DE CONTRATO'),
('LICITACIÓN PÚBLICA'),
('NOTA'),
('RESOLUCIÓN ADMINISTRATIVA'),
('RESOLUCIÓN DE ADJUDICACIÓN'),
('RESOLUCIÓN DE APROBACIÓN DE DOCUMENTO DE LICITACIÓN'),
('RESOLUCIÓN DE CONTRATO');

CREATE TABLE arch_legal(
    id_legal                    SERIAL PRIMARY KEY,
    num_contrato                INT,
    nombre_documento            VARCHAR(50),
    consultor                   VARCHAR(100),
    numero_ci                   VARCHAR(25),
    objeto_contratacion         TEXT,
    fecha_suscripcion           DATE,
    carpeta                     VARCHAR(45),
    codigo_documento_pdf        VARCHAR(30) NOT NULL UNIQUE,
    ubicacion_documento         VARCHAR(250) NOT NULL,
    estado                      SMALLINT DEFAULT 1 CHECK (estado IN (0, 1)),
    CONSTRAINT fk_tipo FOREIGN KEY (id_tipo) REFERENCES tipo_doc (id_tipo) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_detalle   FOREIGN KEY (id_det_contratfin) REFERENCES detalle_contract_finan ON DELETE SET NULL ON UPDATE CASCADE
);