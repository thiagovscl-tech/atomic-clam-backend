import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RegionInfo } from '../common/contracts/age-verification.contracts';

/**
 * Detecção de região por IP. Em produção, plugar aqui um provedor de GeoIP
 * (MaxMind GeoLite2, ipapi, Cloudflare headers, etc). O restante da
 * aplicação depende apenas do método `detect`, então trocar de provedor
 * de GeoIP não exige alterações fora deste arquivo.
 */
@Injectable()
export class GeoIPService {
  detect(request: Request): RegionInfo {
    const cfCountry = request.headers['cf-ipcountry'] as string | undefined;
    if (cfCountry && cfCountry !== 'XX') {
      return { countryCode: cfCountry.toUpperCase(), region: '' };
    }

    // Fallback conservador enquanto nenhum provedor de GeoIP está configurado.
    return { countryCode: 'BR', region: '' };
  }
}
