
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './resources/auth/auth.module';
// import { CotegorieModule } from './resources/categorie/categorie.module';
import { UniteModule } from './resources/unite/unite.module';
// import { TraceModule } from './resources/trace/trace.module';
import { UtilisateurModule } from './resources/utilisateur/utilisateur.module';
// import { MagasinModule } from './resources/magasin/magasin.module';
// import { ClientModule } from './resources/client/client.module';
// import { FournisseurModule } from './resources/fournisseur/fournisseur.module';
// import { DeviseModule } from './resources/devise/devise.module';
// import { RoleModule } from './resources/role/role.module';
// import { ArticleModule } from './resources/article/article.module';
import { DepenseModule } from './resources/depense/depense.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // ArticleModule,
    AuthModule,
    // DeviseModule,
    DepenseModule,
    // CotegorieModule,
    // ClientModule,
    // FournisseurModule,
    // MagasinModule,
    // RoleModule,
    UniteModule,
    UtilisateurModule,
    // TraceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}