// Utility to determine which database models to use
export const usePostgreSQL = (): boolean => {
  const databaseUrl = process.env.DATABASE_URL;
  return !!(databaseUrl && !databaseUrl.includes('username:password@localhost'));
};