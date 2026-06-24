module.exports = (sequelize, DataTypes) => {
  const Chofer = sequelize.define('Chofer', {
    id_chofer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(50),
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    turno: {
      type: DataTypes.ENUM('Mañana', 'Tarde'),
      allowNull: true
    },
    foto_documento: {                        // <-- NUEVO
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      allowNull: false,
      defaultValue: 'Activo'
    },
  }, {
    tableName: 'chofer',
    timestamps: true
  });

  Chofer.associate = function(models) {
    Chofer.hasMany(models.LicenciaChofer, {
      foreignKey: 'id_chofer',
      as: 'licencias'
    });
    Chofer.hasMany(models.AsignacionVehiculo, {
      foreignKey: 'id_chofer',
      as: 'asignaciones'
    });
  };

  return Chofer;
};