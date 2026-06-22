module.exports = (sequelize, DataTypes) => {
    const alias = "Siniestro";
    const cols = {
      id_siniestro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_vehiculo: { type: DataTypes.INTEGER, allowNull: false },
      chofer_involucrado: { type: DataTypes.STRING(100) },
      fecha_siniestro: { type: DataTypes.DATEONLY, allowNull: false },
      ubicacion: { type: DataTypes.STRING(255), allowNull: false },
      relato: { type: DataTypes.TEXT },
      tercero_nombre: { type: DataTypes.STRING(100) },
      tercero_patente: { type: DataTypes.STRING(20) },
      tercero_aseguradora: { type: DataTypes.STRING(100) },
      tercero_poliza: { type: DataTypes.STRING(50) },
      estado: { type: DataTypes.STRING(50), defaultValue: 'En Proceso' },
      archivos_adjuntos: { type: DataTypes.TEXT } // Guardará los nombres de PDF/JPG
    };
    const config = {
      tableName: "siniestro",
      timestamps: true
    };
    const Siniestro = sequelize.define(alias, cols, config);
  
    Siniestro.associate = function(models) {
      Siniestro.belongsTo(models.Vehiculo, {
        as: "vehiculo",
        foreignKey: "id_vehiculo"
      });
    };
    return Siniestro;
  };