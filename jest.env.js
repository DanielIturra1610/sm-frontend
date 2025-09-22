/**
 * Jest Environment Configuration
 * Set up environment variables for testing
 */

// Set up test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api/v1'
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080'
process.env.NEXT_PUBLIC_APP_NAME = 'Stegmaier Safety Management'
process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0'
process.env.NEXT_PUBLIC_APP_DESCRIPTION = 'Comprehensive industrial safety document management system'
process.env.NEXT_PUBLIC_MAX_FILE_SIZE = '10485760'
process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES = 'pdf,doc,docx,jpg,jpeg,png'
process.env.NEXT_PUBLIC_DEBUG_MODE = 'false'
process.env.NEXT_PUBLIC_SHOW_API_LOGS = 'false'
process.env.NEXT_PUBLIC_DEFAULT_TENANT = 'stegmaier'
process.env.NEXT_PUBLIC_ENABLE_TENANT_SIGNUP = 'true'
process.env.NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS = 'true'
process.env.NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS = 'true'
process.env.NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION = 'true'
process.env.NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE = 'true'