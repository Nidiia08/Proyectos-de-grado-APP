-- =====================================================
-- Agrega coasesor a la tabla PROYECTO
-- =====================================================

ALTER TABLE PROYECTO
  ADD COLUMN IF NOT EXISTS coasesor_id INT;

ALTER TABLE PROYECTO
  ADD CONSTRAINT fk_proyecto_coasesor
  FOREIGN KEY (coasesor_id)
  REFERENCES DOCENTE(id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;