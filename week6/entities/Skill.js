const {EntitySchema}= require("typeorm");

module.exports = new EntitySchema({
    name: "Skill",
    tableName: "SKILL", 
    columns: {
      id: {
        primary: true,
        type: "uuid",
        generated: "uuid",
        nullable: false
      },
      name: {
        type: "varchar",
        length: 50,
        nullable: false,
        nuique: true
      },
      created_at: {
        type: "timestamp",
        createDate: true,
        nullable: false
      }
    }
  });
  