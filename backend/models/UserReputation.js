import DB_connect from '../utils/dbConnect.js';
import User from './User.js';

const REPUTATION_VALUES = [-1, 1];

class UserReputation 
{
    constructor(data) 
    {
        this.id = data?.id;
        this.giver_id = data?.giver_id;
        this.receiver_id = data?.receiver_id;
        this.value = data?.value;
        this.created_at = data?.created_at;
        this.updated_at = data?.updated_at;
    }

    static get TOXIC_THRESHOLD() 
    {
        return -5;
    }

    static async rate_user(giver, receiver_id, value) 
    {
        try 
        {
            if(!giver) 
            {
                const error = new Error('User authentication required for reputation');
                error.status = 401;
                throw error;
            }

            const numeric_receiver_id = parseInt(receiver_id);

            if(isNaN(numeric_receiver_id)) 
            {
                const error = new Error('Invalid receiver id');
                error.status = 400;
                throw error;
            }

            if(giver.id === numeric_receiver_id) 
            {
                const error = new Error('Users cannot rate themselves');
                error.status = 400;
                throw error;
            }

            if(!REPUTATION_VALUES.includes(value)) 
            {
                const error = new Error('Reputation value must be +1 or -1');
                error.status = 400;
                throw error;
            }

            const receiver = await User.find_by_id(numeric_receiver_id);
            if(!receiver) 
            {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            const existing = await UserReputation.find_by_participants(giver.id, numeric_receiver_id);

            let action = 'created';
            let delta = value;
            let entry = null;

            if(existing) 
            {
                if(existing.value === value) 
                {
                    await DB_connect.make_request('DELETE FROM user_reputations WHERE id = ?', [existing.id]);
                    action = 'removed';
                    delta = -value;
                    entry = null;
                } else 
                {
                    await DB_connect.make_request('UPDATE user_reputations SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [value, existing.id]);
                    action = 'updated';
                    delta = value - existing.value;
                    existing.value = value;
                    existing.updated_at = new Date();
                    entry = existing;
                }
            } else 
            {
                const result = await DB_connect.make_request(
                    'INSERT INTO user_reputations (giver_id, receiver_id, value) VALUES (?, ?, ?)',
                    [giver.id, numeric_receiver_id, value]
                );

                entry = new UserReputation(
                    {
                        id: result[0].insertId,
                        giver_id: giver.id,
                        receiver_id: numeric_receiver_id,
                        value: value,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                );
            }

            if(delta !== 0) 
            {
                await User.adjust_reputation(numeric_receiver_id, delta, UserReputation.TOXIC_THRESHOLD);
            }

            const summary = await UserReputation.get_summary(numeric_receiver_id);

            return { action, entry, summary };
        } 
        catch(error) 
        {
            if(error.status) throw error;
            throw new Error(`Error rating user: ${error.message}`);
        }
    }

    static async find_by_participants(giver_id, receiver_id) 
    {
        try 
        {
            const query = 'SELECT * FROM user_reputations WHERE giver_id = ? AND receiver_id = ?';
            const result = await DB_connect.make_request(query, [giver_id, receiver_id]);
            const rows = result[0];

            if(rows.length === 0) return null;

            return new UserReputation(rows[0]);
        } 
        catch(error) 
        {
            throw new Error(`Error finding user reputation: ${error.message}`);
        }
    }

    static async get_summary(user_id) 
    {
        try 
        {
            const query = `
                SELECT
                    SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS positives,
                    SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS negatives,
                    COALESCE(SUM(value), 0) AS score,
                    COUNT(*) AS total
                FROM user_reputations
                WHERE receiver_id = ?
            `;

            const result = await DB_connect.make_request(query, [user_id]);
            const rows = result[0];

            return {
                positives: rows[0]?.positives || 0,
                negatives: rows[0]?.negatives || 0,
                score: rows[0]?.score || 0,
                total: rows[0]?.total || 0
            };
        } 
        catch(error) 
        {
            throw new Error(`Error getting reputation summary: ${error.message}`);
        }
    }

    static async list_for_user(user_id, limit = 20, offset = 0) 
    {
        try 
        {
            const query = `
                SELECT ur.*, u.login AS giver_login, u.full_name AS giver_name
                FROM user_reputations ur
                JOIN users u ON ur.giver_id = u.id
                WHERE ur.receiver_id = ?
                ORDER BY ur.updated_at DESC
                LIMIT ? OFFSET ?
            `;

            const result = await DB_connect.make_request(query, [user_id, limit, offset]);
            const rows = result[0];

            return rows.map(row => {
                const record = new UserReputation(row);
                record.giver_login = row.giver_login;
                record.giver_name = row.giver_name;
                return record;
            });
        } 
        catch(error) 
        {
            throw new Error(`Error listing user reputation: ${error.message}`);
        }
    }
}

export default UserReputation;
