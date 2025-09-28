import { Sequelize, DataTypes } from 'sequelize';
import config from '../config.js';

const sequelize = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        logging: false,
        pool: 
        {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: 
        {
            freezeTableName: true,
            timestamps: false
        }
    }
);

const User = sequelize.define('User', {
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    login: 
    {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: 
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    full_name: 
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: 
    {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    profile_picture: 
    {
        type: DataTypes.STRING,
        defaultValue: 'default_avatar.png'
    },
    rating: 
    {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    role: 
    {
        type: DataTypes.ENUM('guest', 'user', 'admin'),
        defaultValue: 'guest'
    },
    email_verified: 
    {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_token: DataTypes.STRING,
    reset_token: DataTypes.STRING
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeUpdate: async (user, options) => {
            if(user.changed('password') && user.password && !user.password.startsWith('$2b$')) {
                try 
                {
                    const bcrypt = await import('bcrypt');
                    user.password = await bcrypt.default.hash(user.password, 10);
                } catch(error) 
                {
                    console.error('Error hashing password:', error);
                }
            }
        }
    }
});

async function connect_test() 
{
    try 
    {
        await sequelize.authenticate();
        console.log('✅ AdminJS: Database connection established successfully.');
        
        const user_count = await User.count();
        console.log(`📊 AdminJS: Found ${user_count} users in database`);
        
    } catch(error) 
    {
        console.error('❌ AdminJS: Database connection or model error:', error);
    }
}

connect_test();

const Post = sequelize.define('Post', {
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    author_id: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: 
        {
            model: User,
            key: 'id'
        }
    },
    title: 
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: 
    {
        type: DataTypes.TEXT,
        allowNull: false
    },
    publish_date: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    status: 
    {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    created_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    updated_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Comment = sequelize.define('Comment', {
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    author_id: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: 
        {
            model: User,
            key: 'id'
        }
    },
    post_id: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: 
        {
            model: Post,
            key: 'id'
        }
    },
    content: 
    {
        type: DataTypes.TEXT,
        allowNull: false
    },
    publish_date: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    status: 
    {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    created_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    updated_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Category = sequelize.define('Category', {
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: 
    {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: 
    {
        type: DataTypes.TEXT
    },
    created_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    updated_at: 
    {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(Comment, { foreignKey: 'author_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

export { sequelize, User, Post, Comment, Category };
