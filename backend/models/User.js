import dbConnect from '../utils/dbConnect.js';
import Permission from './Permission.js';

import bcrypt from 'bcrypt';

class User 
{
    constructor(userData) 
    {
        this.id = userData?.id;
        this.login = userData?.login;
        this.password = userData?.password;
        this.full_name = userData?.full_name;
        this.email = userData?.email;
        this.profile_picture = userData?.profile_picture || 'default_avatar.png';
        this.rating = userData?.rating || 0;
        this.role = userData?.role || 'user';
        this.email_verified = userData?.email_verified || false;
        this.verification_token = userData?.verification_token;
        this.reset_token_hash = userData?.reset_token_hash;
        this.reset_token_expires_at = userData?.reset_token_expires_at;
        this.password_changed_at = userData?.password_changed_at;
        this.created_at = userData?.created_at;
        this.updated_at = userData?.updated_at;
    }

    async create() 
    {
        try 
        {
            const hashedPassword = await bcrypt.hash(this.password, 10);

            const plainToken = await bcrypt.genSalt(10); // generate random token (plain)

            this.verification_token = await bcrypt.hash(plainToken, 10);//hash code with bcrypt

            const query = `
                INSERT INTO users (login, password, full_name, email, profile_picture, role, verification_token)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await dbConnect.make_request(query, [
                this.login,
                hashedPassword,
                this.full_name,
                this.email,
                this.profile_picture ?? 'default_avatar.png',
                this.role ?? 'user',
                this.verification_token
            ]);

            console.log('Вставка в БД:', this.login, this.email);
            console.log('Plain token (отправить пользователю):', plainToken);
            console.log('Hashed token (в БД):', this.verification_token);

            this.id = result[0].insertId;
            return { user: this, plainToken };
        } catch(error) 
        {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    static async find_by_id(id) 
    {
        try 
        {
            const query = 'SELECT * FROM users WHERE id = ?';
            const result = await dbConnect.make_request(query, [id]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new User(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    static async find_by_login(login) 
    {
        try 
        {
            const query = 'SELECT * FROM users WHERE login = ?';
            const result = await dbConnect.make_request(query, [login]);
            const rows = result[0];
            
            console.log('Database search for login:', login);
            console.log('Found rows:', rows.length);
            
            if(rows.length === 0) return null;
            
            console.log('User data from DB:', {
                id: rows[0].id,
                login: rows[0].login,
                email: rows[0].email,
                email_verified: rows[0].email_verified,
                password_length: rows[0].password?.length
            });
            
            return new User(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding user by login: ${error.message}`);
        }
    }

    static async find_by_email(email) 
    {
        try 
        {
            const query = 'SELECT * FROM users WHERE email = ?';
            const result = await dbConnect.make_request(query, [email]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new User(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    static async find_all() 
    {
        try 
        {
            const query = 'SELECT * FROM users ORDER BY created_at DESC';
            const result = await dbConnect.make_request(query);
            const rows = result[0];
            
            return rows.map(row => new User(row));
        } 
        catch(error) 
        {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }

    async update(updateData) 
    {
        try 
        {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if(updateData[key] !== undefined && key !== 'id') 
                {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if(fields.length === 0) throw new Error('No fields to update');
            
            values.push(this.id);
            
            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            await dbConnect.make_request(query, values);
            
            Object.assign(this, updateData);
            
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async delete() 
    {
        try 
        {
            const query = 'DELETE FROM users WHERE id = ?';
            await dbConnect.make_request(query, [this.id]);
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    async check_password(password) 
    {
        try 
        {
            return await bcrypt.compare(password, this.password);
        } 
        catch(error) 
        {
            throw new Error(`Error checking password: ${error.message}`);
        }
    }

    async update_password(newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const changedAt = new Date();
            await this.update({ password: hashedPassword, password_changed_at: changedAt });
            return true;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }

    async verify_email() 
    {
        try 
        {
            await this.update({ 
                email_verified: true, 
                verification_token: null 
            });
            
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error verifying email: ${error.message}`);
        }
    }

    async set_reset_token(plainToken, ttlMinutes = 30) {
        try {
            const hash = await bcrypt.hash(plainToken, 10);
            const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
            await this.update({ reset_token_hash: hash, reset_token_expires_at: expiresAt });
            return true;
        } catch (error) {
            throw new Error(`Error setting reset token: ${error.message}`);
        }
    }

    async clear_reset_token() {
        try {
            await this.update({ reset_token_hash: null, reset_token_expires_at: null });
            return true;
        } catch (error) {
            throw new Error(`Error clearing reset token: ${error.message}`);
        }
    }

    async verify_reset_token(plainToken) {
        try {
            if (!this.reset_token_hash || !this.reset_token_expires_at) return false;
            const now = new Date();
            if (new Date(this.reset_token_expires_at) < now) return false;
            return await bcrypt.compare(plainToken, this.reset_token_hash);
        } catch (error) {
            throw new Error(`Error verifying reset token: ${error.message}`);
        }
    }

    static async find_by_verification_token(token) 
    {
        try 
        {
            const query = 'SELECT * FROM users WHERE verification_token = ?';
            const result = await dbConnect.make_request(query, [token]);
            const rows = result[0];
            
            if(rows.length === 0) return null;
            
            return new User(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding user by verification token: ${error.message}`);
        }
    }

    getPublicData() 
    {
        return {
            id: this.id,
            login: this.login,
            full_name: this.full_name,
            profile_picture: this.profile_picture,
            rating: this.rating,
            role: this.role,
            created_at: this.created_at
        };
    }

    async has_permission(permission) 
    {
        try 
        {
            return await Permission.has_permission(this.role, permission);
        } 
        catch(error) 
        {
            throw new Error(`Error checking user permission: ${error.message}`);
        }
    }

    async get_permissions() 
    {
        try 
        {
            return await Permission.get_permissions_for_role(this.role);
        } 
        catch(error) 
        {
            throw new Error(`Error getting user permissions: ${error.message}`);
        }
    }

    is_admin() 
    {
        return this.role === Permission.ROLES.ADMIN;
    }

    is_user() 
    {
        return this.role === Permission.ROLES.USER;
    }

    can_edit_post(post) 
    {
        return this.is_admin() || post.author_id === this.id;
    }

    can_delete_post(post) 
    {
        return this.is_admin() || post.author_id === this.id;
    }

    can_edit_comment(comment) 
    {
        return this.is_admin() || comment.author_id === this.id;
    }

    can_delete_comment(comment) 
    {
        return this.is_admin() || comment.author_id === this.id;
    }

    can_manage_user(targetUser) 
    {
        return this.is_admin() && targetUser.id !== this.id;
    }

    can_change_role(targetUser, newRole) 
    {
        if(!this.is_admin()) return false;
        if(targetUser.id === this.id) return false;
        
        const role_hierarchy = {
            [Permission.ROLES.GUEST]: 0,
            [Permission.ROLES.USER]: 1,
            [Permission.ROLES.ADMIN]: 2
        };
        
        return role_hierarchy[newRole] <= role_hierarchy[this.role];
    }

    async change_role(newRole) 
    {
        try 
        {
            if(!Object.values(Permission.ROLES).includes(newRole)) throw new Error('Invalid role');
            
            await this.update({ role: newRole });
            return this;
        } 
        catch(error) 
        {
            throw new Error(`Error changing user role: ${error.message}`);
        }
    }

    static async find_by_role(role) 
    {
        try 
        {
            const query = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC';
            const result = await dbConnect.make_request(query, [role]);
            const rows = result[0];
            
            return rows.map(row => new User(row));
        } 
        catch(error) 
        {
            throw new Error(`Error finding users by role: ${error.message}`);
        }
    }

    static async get_user_stats() 
    {
        try 
        {
            const query = `
                SELECT 
                    role,
                    COUNT(*) as count,
                    COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_count
                FROM users 
                GROUP BY role
            `;
            
            const result = await dbConnect.make_request(query);
            const rows = result[0];
            return rows;
        } 
        catch(error) 
        {
            throw new Error(`Error getting user stats: ${error.message}`);
        }
    }

    async update_role(role) 
    {
        try 
        {
            const query = `UPDATE users SET role = ? WHERE id = ?`;
            await dbConnect.make_request(query, [role, this.id]);
            this.role = role;
            return true;
        } 
        catch(error) 
        {
            throw new Error(`Error updating user role: ${error.message}`);
        }
    }
}

export default User;
