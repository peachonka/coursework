using BudgetApi.Data;
using BudgetApi.Models;
using BudgetApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Укажите ваш фронтенд-адрес
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Это критически важно для кук
    });
});

// Конфигурация базы данных
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Добавление сервисов
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IFamilyService, FamilyService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserService, UserService>();

// Настройка аутентификации JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Пробуем получить токен из куки
                context.Token = context.Request.Cookies["jwt_token"];
                
                // Если нет в куках, пробуем из заголовка Authorization
                if (string.IsNullOrEmpty(context.Token))
                {
                    var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                    if (authHeader?.StartsWith("Bearer ") == true)
                    {
                        context.Token = authHeader.Substring("Bearer ".Length).Trim();
                    }
                }
                
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Budget API", Version = "v1" });
    
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter JWT Bearer token",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    
    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// Конфигурация middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.Use(async (context, next) =>
// {
//     Console.WriteLine($"Incoming request: {context.Request.Method} {context.Request.Path}");
//     await next();
//     Console.WriteLine($"Response: {context.Response.StatusCode}");
// });

// app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Budget API V1");
    c.ConfigObject.AdditionalItems["requestCredentials"] = "include";
    c.OAuthClientId("swagger-ui");
    c.OAuthAppName("Swagger UI");
});

app.Run();