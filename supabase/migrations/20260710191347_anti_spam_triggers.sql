-- 1. Función y Trigger para limitar la subida masiva de anuncios
CREATE OR REPLACE FUNCTION check_listing_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_listings_count INT;
  minute_listings_count INT;
BEGIN
  -- Contar anuncios creados en el último minuto (Ráfaga)
  SELECT COUNT(*)
  INTO minute_listings_count
  FROM public.listings
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF minute_listings_count >= 20 THEN
    RAISE EXCEPTION 'Límite de subida por minuto excedido (Max 20/min). Por favor, espera un momento para subir más anuncios.';
  END IF;

  -- Contar anuncios en las últimas 24 horas
  SELECT COUNT(*)
  INTO daily_listings_count
  FROM public.listings
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF daily_listings_count >= 100 THEN
    RAISE EXCEPTION 'Has alcanzado el límite diario de anuncios nuevos (Máximo 100/día).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_listing_rate_limit ON public.listings;
CREATE TRIGGER tr_check_listing_rate_limit
BEFORE INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION check_listing_rate_limit();


-- 2. Función y Trigger para limitar el envío masivo de mensajes (Phishing)
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_new_chats INT;
  minute_new_chats INT;
  already_messaged BOOLEAN;
BEGIN
  -- Comprobar si ya le ha escrito a este usuario antes (si ya había chat, no cuenta para el límite)
  SELECT EXISTS (
    SELECT 1 FROM public.messages 
    WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id
  ) INTO already_messaged;

  IF NOT already_messaged THEN
    -- Contar a cuántas personas DISTINTAS le ha escrito por primera vez en 1 MINUTO (Anti-Script)
    SELECT COUNT(DISTINCT receiver_id)
    INTO minute_new_chats
    FROM public.messages
    WHERE sender_id = NEW.sender_id
      AND created_at > NOW() - INTERVAL '1 minute';

    IF minute_new_chats >= 15 THEN
      RAISE EXCEPTION 'Estás enviando mensajes a personas nuevas demasiado rápido. Por favor, espera un minuto.';
    END IF;

    -- Contar a cuántas personas DISTINTAS le ha escrito por primera vez en 24 HORAS
    SELECT COUNT(DISTINCT receiver_id)
    INTO daily_new_chats
    FROM public.messages
    WHERE sender_id = NEW.sender_id
      AND created_at > NOW() - INTERVAL '24 hours';

    IF daily_new_chats >= 100 THEN
      RAISE EXCEPTION 'Para evitar el spam, puedes iniciar un máximo de 100 chats nuevos al día.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_message_rate_limit ON public.messages;
CREATE TRIGGER tr_check_message_rate_limit
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION check_message_rate_limit();
