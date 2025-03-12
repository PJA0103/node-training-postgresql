const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema ({
    name: "Course",
    tableName: "COURSE",
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
            nullable: false,
        },
        skill_id: {
            type: "uuid",
            generated: "uuid",
            nullable: false,            
        },
        name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        description: {
            type: "text",
            nullable: false
        },
        start_at: {
            type: "timestamp",
            nullable: false
        },
        end_at: {
            type: "timestamp",
            nullable: false
        },
        max_participants: {
            type: "integer",
            nullable: false
        },
        meeting_url: {
            type: "varchar",
            length: 2048,
            nullable: true
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
            inverseSide: "Course",
            joinColumn:{
                name: "user_id",
                referencedColumnName: "id",
                foreignKeyConstrainName: "course_user_fk"
            }
        },
        Skill: {
            target: "Skill",
            type: "ManyToOne",
            inverseSide: "Course",
            joinColumn:{
                name: "skill_id",
                referencedColumnName: "id",
                foreignKeyConstrainName: "course_skill_fk"
            }
        }

    }
})