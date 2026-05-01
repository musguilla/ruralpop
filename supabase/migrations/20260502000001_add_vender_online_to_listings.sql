-- Añadir flag de vender_online para Escrow
ALTER TABLE listings ADD COLUMN IF NOT EXISTS vender_online BOOLEAN DEFAULT false;
