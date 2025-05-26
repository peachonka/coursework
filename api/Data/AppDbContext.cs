using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Family> Families { get; set; }
        public DbSet<FamilyMember> FamilyMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка связи Family -> User (Creator)
            modelBuilder.Entity<Family>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.CreatorId)
                .OnDelete(DeleteBehavior.Cascade); // Или Cascade в зависимости от требований

            // Настройка связи Family -> FamilyMembers
            modelBuilder.Entity<Family>()
                .HasMany(f => f.FamilyMembers)
                .WithOne(fm => fm.Family)
                .HasForeignKey(fm => fm.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Настройка связи FamilyMember -> User
            // modelBuilder.Entity<FamilyMember>()
            //     .HasOne(fm => fm.User)
            //     .WithMany()
            //     .HasForeignKey(fm => fm.UserId)
            //     .OnDelete(DeleteBehavior.Cascade);

            // Дополнительные настройки (если нужно)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Настройка для Expenses и Incomes
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.FamilyMember)
                .WithMany()
                .HasForeignKey(e => e.FamilyMemberId);

            modelBuilder.Entity<Income>()
                .HasOne(i => i.FamilyMember)
                .WithMany()
                .HasForeignKey(i => i.FamilyMemberId);
        }
    }
}