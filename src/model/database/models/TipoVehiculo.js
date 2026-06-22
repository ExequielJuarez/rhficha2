module.exports = (sequelize, dataTypes) => {
    const alias = 'TipoVehiculo';
    const cols = {
        id_tipo: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        descripcion: {
            type: dataTypes.STRING(100),
            allowNull: false
        }
    };
    const config = {
        tableName: 'tipo_vehiculo',
        timestamps: false
    };

    const TipoVehiculo = sequelize.define(alias, cols, config);
    return TipoVehiculo;
};