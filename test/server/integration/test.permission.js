var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , app = require ( '../../../index' )
  , testEnv = require ( './util' ).testEnv;


describe ( '/job', function () {
    var authUser
      , cookie
      , authUsername = "dimitrios@clevertech.biz"
      , authPass = '1q2w3e';

    before ( function ( done ) {
        this.timeout ( 9000 );
        testEnv ().then ( function () {
            //Get Auth User
            request ( app )
                .post ( '/user/login' )
                .send ( { username: authUsername, password: authPass } )
                .end ( function ( err, res ) {
                    expect ( err ).to.not.exist;
                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    cookie = res.headers['set-cookie'];
                    authUser = res.body;
                    done ();
                } );
        } )
            .fail ( done );
    } );

    // /*** GET REQUEST ***/
    describe ( 'GET /permissions', function () {

        it ( 'should return status 200 and an list of system defined permissions', function ( done ) {

            request ( app )
                .get ( '/permissions' )
                .set ( 'cookie', cookie )
                .end ( function ( err, res ) {

                    expect ( err ).to.not.exist;

                    expect ( res ).to.have.property ( 'status' ).and.equal ( 200 );
                    expect ( res ).to.have.property ( 'header' );
                    expect ( res.header ).to.have.property ( 'content-type', 'application/json' );
                    expect ( res ).to.have.property ( 'body' );
                    expect ( res.body.length ).to.exist;
                    expect ( res.body ).to.have.length.above ( 0 );

                    done ();
                } );
        } );

    } );

} );




