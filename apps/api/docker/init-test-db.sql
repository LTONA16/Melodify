-- La base de pruebas vive en la misma instancia que la de desarrollo.
--
-- Se crea aquí, al inicializar el volumen, y no desde el código: así `prisma
-- migrate deploy` puede aplicarle las mismas migraciones que a `melodify` sin
-- que nadie tenga que crear bases a mano. `\gexec` la hace idempotente.
SELECT 'CREATE DATABASE melodify_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'melodify_test')\gexec
