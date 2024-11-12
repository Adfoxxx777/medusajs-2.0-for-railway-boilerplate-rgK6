import { ModuleProviderExports } from '@medusajs/types'
import { SendPulseNotificationService } from './services/sendpulse-smtp'

const services = [SendPulseNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
