
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './resources/auth/auth.module';
// import { CotegorieModule } from './resources/categorie/categorie.module';
import { UniteModule } from './resources/unite/unite.module';
import { TraceModule } from './resources/trace/trace.module';
import { UtilisateurModule } from './resources/utilisateur/utilisateur.module';
import { MagasinProduitFiniModule } from './resources/magasin/produit-fini/magasin.module';
import { MagasinMatierePremiereModule } from './resources/magasin/matiere-premiere/magasin.module';
import { ClientModule } from './resources/client/client.module';
import { FournisseurModule } from './resources/fournisseur/fournisseur.module';
import { DeviseModule } from './resources/devise/devise.module';
import { RoleModule } from './resources/role/role.module';
import { MatiereModule } from './resources/matiere-premiere/matiere-premiere.module';
import { ProduitModule } from './resources/produit-fini/produit-fini.module';
import { DepenseModule } from './resources/depense/depense.module';
import { AchatsModule } from './resources/achat/achat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MatiereModule,
    ProduitModule,
    AuthModule,
    DeviseModule,
    DepenseModule,
    // CotegorieModule,
    ClientModule,
    FournisseurModule,
    MagasinProduitFiniModule,
    MagasinMatierePremiereModule,
    RoleModule,
    UniteModule,
    UtilisateurModule,
    TraceModule,
    AchatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}