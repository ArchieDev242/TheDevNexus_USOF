const make_enum = (values = []) => values.map((value) => ({ value, label: String(value) }));

const base_model = ({ name, tableName, primaryKey = 'id', properties }) => ({
	name,
	tableName,
	primaryKey,
	properties,
	database: 'USOF'
});

const user_model = base_model({
	name: 'User',
	tableName: 'users',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		login: { type: 'string', required: true, isTitle: true, position: 2 },
		password: { type: 'password', position: 3 },
		full_name: { type: 'string', position: 4 },
		email: { type: 'string', required: true, position: 5 },
		role: { type: 'string', availableValues: make_enum(['user', 'admin', 'guest']), position: 6 },
		email_verified: { type: 'boolean', position: 7 },
		rating: { type: 'number', position: 8 },
		reputation_score: { type: 'number', position: 9 },
		is_toxic: { type: 'boolean', position: 10 },
		profile_picture: { type: 'string', position: 11 },
		bio: { type: 'richtext', position: 12 },
		website: { type: 'string', position: 13 },
		twitter: { type: 'string', position: 14 },
		github: { type: 'string', position: 15 },
		linkedin: { type: 'string', position: 16 },
		itch: { type: 'string', position: 17 },
		gamebanana: { type: 'string', position: 18 },
		gamejolt: { type: 'string', position: 19 },
		twitch: { type: 'string', position: 20 },
		engines: { type: 'string', position: 21 },
		created_at: { type: 'datetime', position: 98, isSortable: true },
		updated_at: { type: 'datetime', position: 99, isSortable: true },
		verification_token: { type: 'string', position: 100 },
		reset_token: { type: 'string', position: 101 },
		reset_token_hash: { type: 'string', position: 102 },
		reset_token_expires_at: { type: 'datetime', position: 103 },
		password_changed_at: { type: 'datetime', position: 104 }
	}
});

const post_model = base_model({
	name: 'Post',
	tableName: 'posts',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		author_id: { type: 'number', position: 2 },
		title: { type: 'string', required: true, isTitle: true, position: 3 },
		content: { type: 'richtext', required: true, position: 4 },
		status: { type: 'string', availableValues: make_enum(['active', 'inactive']), position: 5 },
		is_closed: { type: 'boolean', position: 6 },
		closed_reason: { type: 'string', position: 7 },
		publish_date: { type: 'datetime', position: 8, isSortable: true },
		rating: { type: 'number', position: 9 },
		created_at: { type: 'datetime', position: 98, isSortable: true },
		updated_at: { type: 'datetime', position: 99, isSortable: true }
	}
});

const comment_model = base_model({
	name: 'Comment',
	tableName: 'comments',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		post_id: { type: 'number', position: 2 },
		author_id: { type: 'number', position: 3 },
		parent_comment_id: { type: 'number', position: 4 },
		content: { type: 'richtext', required: true, position: 5 },
		status: { type: 'string', availableValues: make_enum(['active', 'inactive']), position: 6 },
		publish_date: { type: 'datetime', position: 7, isSortable: true },
		created_at: { type: 'datetime', position: 98, isSortable: true },
		updated_at: { type: 'datetime', position: 99, isSortable: true }
	}
});

const category_model = base_model({
	name: 'Category',
	tableName: 'categories',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		title: { type: 'string', required: true, isTitle: true, position: 2 },
		description: { type: 'richtext', required: true, position: 3 },
		created_at: { type: 'datetime', position: 98, isSortable: true },
		updated_at: { type: 'datetime', position: 99, isSortable: true }
	}
});

const achievement_model = base_model({
	name: 'Achievement',
	tableName: 'achievements',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		key_name: { type: 'string', required: true, isTitle: true, position: 2 },
		title: { type: 'string', required: true, position: 3 },
		description: { type: 'richtext', required: true, position: 4 },
		icon: { type: 'string', required: true, position: 5 },
		points: { type: 'number', position: 6 },
		is_active: { type: 'boolean', position: 7 },
		created_at: { type: 'datetime', position: 98, isSortable: true },
		updated_at: { type: 'datetime', position: 99, isSortable: true }
	}
});

const like_model = base_model({
	name: 'Like',
	tableName: 'likes',
	properties: {
		id: { type: 'number', position: 1, isSortable: true },
		author_id: { type: 'number', position: 2 },
		post_id: { type: 'number', position: 3 },
		comment_id: { type: 'number', position: 4 },
		type: { type: 'string', availableValues: make_enum(['like', 'dislike', 'thanks']), position: 5 },
		publish_date: { type: 'datetime', position: 6, isSortable: true }
	}
});

export {
	user_model,
	post_model,
	comment_model,
	category_model,
	achievement_model,
	like_model
};
