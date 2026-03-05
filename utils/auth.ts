
import { Role, CompanyProfile, AssetType } from '../types';
import { ROLE_PERMISSIONS, ASSET_VISIBILITY, NAV_AREAS } from '../constants';

export const hasPermission = (area: NAV_AREAS, role: Role, profile: CompanyProfile | null): boolean => {
    if (!profile) return false;

    const roleHasAccess = ROLE_PERMISSIONS[role]?.includes(area) ?? false;
    if (!roleHasAccess) return false;

    const requiredAssets = ASSET_VISIBILITY[area];
    if (!requiredAssets) return true; // No specific assets required, access granted if role matches

    // Check if the company has at least one of the required assets
    return profile.assets.some(asset => requiredAssets.includes(asset));
};
