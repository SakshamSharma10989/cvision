const jobStore = global.jobStore || new Map();
if (!global.jobStore) global.jobStore = jobStore;

export default jobStore;
