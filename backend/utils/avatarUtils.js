export const DEFAULT_AVATAR = '/user/avatar.jpg';

export function normalize_avatar(value) 
{
    if(!value || value === 'default_avatar.png') return DEFAULT_AVATAR;
    
    return value;
}
