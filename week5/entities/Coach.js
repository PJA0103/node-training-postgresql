const {EntitySchema, JoinColumn} = require("typeorm")

module.exports = new EntitySchema({
    name: "Coach",
    tableName: "COACH",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
            nullable: false
        },
        user_id: {
            type: "uuid",
            generated: "uuid",
            nullable: false
        },
        experience_years: {
            type: "integer",
            nullable: false
        },
        description: {
            type: "text",
            nullable: false
        },
        profile_image_url: {
            type: "varchar",
            length: 2048
        },
        created_at: {
            type: "timestamp",
            createDate: true,
            nullable: false
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
            nullable: false
        }
    },
    relations: {
        User:{ 
            target: "User",
            type: "OneToOne",
            inverseSide: "Coach", 
            joinColumn:{
                name: "user_id",
                referencedColumnName: "id",
                foreignKeyConstrainName: "coach_user_fk"
            }
        }
    }
})