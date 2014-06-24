var utils       = require( 'utils' )
  , env         = utils.bootstrapEnv()
  , moduleLdr   = env.moduleLoader
  , packageJson = env.packageJson
  , expect      = require( 'chai' ).expect
  , injector    = require( 'injector' )
  , ncp         = require( 'ncp' )
  , fs          = require( 'fs' )
  , path        = require( 'path' );

describe( 'test.utils.moduleLoader', function() {

    before( function( done ) {
        var source  = path.resolve( __dirname, 'test-module' )
          , dest    = path.resolve( __dirname, '..', '..', 'modules', 'test-module' )
          , pkgJson = path.resolve( __dirname, '..', '..', 'package.json' );

        // Copy the test-module into the modules folder
        ncp( source, dest, function( err ) {
            if ( !err ) {

                // Add to bundledDependencies
                if ( packageJson.bundledDependencies.indexOf( 'test-module' ) === -1 ) {
                    packageJson.bundledDependencies.push( 'test-module' );
                    fs.writeFile( pkgJson, JSON.stringify( packageJson, null, '  ' ), function( e ) {
                        injector.instance( 'packageJson', packageJson );
                        done( e );
                    });
                } else {
                    done();
                }
            } else {
                done( err );
            }
        });
    });

    it( 'should load modules', function( done ) {
        this.timeout( 10000 );
        
        moduleLdr.on( 'modulesLoaded', function() {
            // @TODO this only supports the orm module!!!
            injector
                .getInstance( 'sequelize' )
                .sync( { force: true } )
                .success( function() {
                    done();
                })
                .error( done );
        });
        moduleLdr.loadModules();
    });

    it( 'should initialize all module routes', function( done ) {
        moduleLdr.on( 'routesInitialized', function() {
            done();
        });
        moduleLdr.initializeRoutes();
    });
});