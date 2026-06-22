const db = require('../model/database/models')
const fs = require('fs');
const path = require('path');


const userService = {
    
    getAll: async function () {
    
        try {
          return await db.Usuario.findAll ({
          })
        } catch (error) {
          console.log(error);
          return [];
        }
      },

    findByField : async function (field,otrotext,text) {
      try {
          let allUsers = await this.getAll();
          let userFound = allUsers.find(oneUser => oneUser[field] === text || oneUser[otrotext] === text );
          return userFound ;
      } catch (error) {
        
      }
      
    }
}

module.exports = userService